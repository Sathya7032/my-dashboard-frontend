import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./auth/AuthContext";
import { Container, Form, Button, Spinner, Card, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./LoginPage.css"; // We'll create this CSS file
import { useNavigate } from 'react-router-dom';

const MySwal = withReactContent(Swal);

const LoginPage = () => {
  const { saveToken } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ 
    username: "", 
    password: "", 
    otp: "" 
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!form.otp.trim()) newErrors.otp = "OTP is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateStep1()) return;
    
    setIsLoading(true);
    try {
      await axios.post("http://ec2-43-205-233-195.ap-south-1.compute.amazonaws.com:8080/auth/login", {
        username: form.username,
        password: form.password,
      });
      
      setIsLoading(false);
      MySwal.fire({
        title: "OTP Sent!",
        text: "Please check your email for the OTP code",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      
      // Animate transition between steps
      setFadeIn(false);
      setTimeout(() => {
        setStep(2);
        setFadeIn(true);
      }, 300);
      
    } catch (err) {
      setIsLoading(false);
      MySwal.fire({
        title: "Login Failed",
        text: err.response?.data?.message || "Invalid credentials",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateStep2()) return;
    
    setIsLoading(true);
    try {
      const res = await axios.post("http://ec2-43-205-233-195.ap-south-1.compute.amazonaws.com:8080/auth/verify-otp", {
        username: form.username,
        otp: form.otp,
      });
      
      saveToken(res.data);
      setIsLoading(false);
      
      MySwal.fire({
        title: "Success!",
        text: "You have successfully logged in",
        icon: "success",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        // Redirect or other action after login
        navigate('/dashboard');
      });
      
    } catch (err) {
      setIsLoading(false);
      MySwal.fire({
        title: "Verification Failed",
        text: err.response?.data?.message || "Invalid OTP code",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <div className={`login-container ${fadeIn ? "fade-in" : "fade-out"}`}>
        <Card className="shadow-lg" style={{ width: "22rem" }}>
          <Card.Body>
            <div className="text-center mb-4">
              <h2 className="fw-bold text-primary">
                {step === 1 ? "Welcome Back" : "Verify Identity"}
              </h2>
              <p className="text-muted">
                {step === 1 
                  ? "Please enter your credentials" 
                  : "Enter the OTP sent to your email"}
              </p>
            </div>

            {step === 1 ? (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={form.username}
                    onChange={handleChange}
                    isInvalid={!!errors.username}
                    className="input-field"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    className="input-field"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  variant="primary"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-100 py-2 login-button"
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </Form>
            ) : (
              <Form>
                <Alert variant="info" className="text-center">
                  OTP sent to your registered email
                </Alert>

                <Form.Group className="mb-4">
                  <Form.Label>OTP Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={form.otp}
                    onChange={handleChange}
                    isInvalid={!!errors.otp}
                    className="input-field"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.otp}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setFadeIn(false);
                      setTimeout(() => {
                        setStep(1);
                        setFadeIn(true);
                      }, 300);
                    }}
                    className="flex-grow-1"
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleVerifyOtp}
                    disabled={isLoading}
                    className="flex-grow-1 verify-button"
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Verifying...
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default LoginPage;