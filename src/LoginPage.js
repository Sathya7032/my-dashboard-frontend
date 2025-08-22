import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./auth/AuthContext";
import { Container, Form, Button, Spinner, Card, Alert, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./LoginPage.css";
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaKey, FaArrowLeft, FaSignInAlt } from "react-icons/fa";

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
    else if (form.otp.trim().length !== 6) newErrors.otp = "OTP must be 6 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateStep1()) return;
    
    setIsLoading(true);
    try {
      await axios.post("https://backend.codewithsathya.info/auth/login", {
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
      const res = await axios.post("https://backend.codewithsathya.info/auth/verify-otp", {
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
    <Container fluid className="login-page-container d-flex justify-content-center align-items-center min-vh-100">
      <div className="background-design">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className={`login-container ${fadeIn ? "fade-in" : "fade-out"}`}>
        <Card className="shadow-lg login-card">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <div className="login-icon-container mb-3">
                <div className="login-icon">
                  <FaSignInAlt />
                </div>
              </div>
              <h2 className="fw-bold text-primary mb-2">
                {step === 1 ? "Welcome Back" : "Verify Identity"}
              </h2>
              <p className="text-muted mb-0">
                {step === 1 
                  ? "Please enter your credentials to continue" 
                  : "Enter the OTP sent to your email to complete login"}
              </p>
            </div>

            {step === 1 ? (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Username</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaUser className="text-muted" />
                    </span>
                    <Form.Control
                      type="text"
                      name="username"
                      placeholder="Enter username"
                      value={form.username}
                      onChange={handleChange}
                      isInvalid={!!errors.username}
                      className="input-field"
                    />
                  </div>
                  <Form.Control.Feedback type="invalid" className="d-block">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="form-label">Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaLock className="text-muted" />
                    </span>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      value={form.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      className="input-field"
                    />
                  </div>
                  <Form.Control.Feedback type="invalid" className="d-block">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  variant="primary"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-100 py-3 login-button gradient-btn"
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
                    "Login to Continue"
                  )}
                </Button>
                
                <div className="text-center mt-3">
                  <a href="#" className="text-muted small">Forgot password?</a>
                </div>
              </Form>
            ) : (
              <Form>
                <Alert variant="info" className="text-center otp-alert">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <strong>OTP Sent!</strong> Please check your registered email
                    </div>
                  </div>
                </Alert>

                <Form.Group className="mb-4">
                  <Form.Label className="form-label">OTP Verification Code</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaKey className="text-muted" />
                    </span>
                    <Form.Control
                      type="text"
                      name="otp"
                      placeholder="Enter 6-digit code"
                      value={form.otp}
                      onChange={handleChange}
                      isInvalid={!!errors.otp}
                      className="input-field"
                      maxLength="6"
                    />
                  </div>
                  <Form.Text className="text-muted small">
                    Enter the 6-digit code sent to your email
                  </Form.Text>
                  <Form.Control.Feedback type="invalid" className="d-block">
                    {errors.otp}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row className="g-2">
                  <Col md={6}>
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setFadeIn(false);
                        setTimeout(() => {
                          setStep(1);
                          setFadeIn(true);
                        }, 300);
                      }}
                      className="w-100 py-2 back-button"
                    >
                      <FaArrowLeft className="me-2" />
                      Back
                    </Button>
                  </Col>
                  <Col md={6}>
                    <Button
                      variant="primary"
                      onClick={handleVerifyOtp}
                      disabled={isLoading}
                      className="w-100 py-2 verify-button gradient-btn"
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
                        "Verify & Login"
                      )}
                    </Button>
                  </Col>
                </Row>
                
                <div className="text-center mt-3">
                  <a href="#" className="text-muted small">Didn't receive code? Resend</a>
                </div>
              </Form>
            )}
            
            <div className="text-center mt-4 pt-3 border-top">
              <p className="text-muted mb-0">Don't have an account? <a href="#" className="text-primary">Sign up</a></p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default LoginPage;