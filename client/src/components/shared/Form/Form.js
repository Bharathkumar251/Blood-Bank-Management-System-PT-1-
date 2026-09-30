import React, { useState } from "react";
import InputType from "./InputType";
import { Link } from "react-router-dom";
import { handleLogin, handleRegister } from "../../../services/authService";

const Form = ({ formType, submitBtn, formTitle }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donar");
  const [name, setName] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="card shadow-sm border-0 p-4 w-100" style={{ maxWidth: "480px", borderRadius: "12px" }}>
      <form
        onSubmit={(e) => {
          if (formType === "login") {
            return handleLogin(e, email, password, role);
          } else if (formType === "register") {
            return handleRegister(
              e,
              name,
              role,
              email,
              password,
              phone,
              organisationName,
              address,
              hospitalName,
              website
            );
          }
        }}
      >
        <div className="text-center mb-3">
          <h2 className="fw-bold mb-1" style={{ color: "#b01826" }}>
            {formTitle}
          </h2>
          <p className="text-muted small">
            {formType === "login"
              ? "Access your Blood Bank Management Portal"
              : "Register your account & receive instant email verification"}
          </p>
        </div>
        <hr className="my-2" />

        {/* Role Selector */}
        <div className="mb-3">
          <label className="form-label d-block text-secondary small fw-bold mb-2">
            SELECT ACCOUNT TYPE:
          </label>
          <div className="d-flex flex-wrap gap-2 justify-content-between">
            <div className="form-check form-check-inline">
              <input
                type="radio"
                className="form-check-input"
                name="role"
                id="donarRadio"
                value="donar"
                checked={role === "donar"}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="donarRadio" className="form-check-label fw-semibold" style={{ fontSize: "14px" }}>
                Donor
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                type="radio"
                className="form-check-input"
                name="role"
                id="hospitalRadio"
                value="hospital"
                checked={role === "hospital"}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="hospitalRadio" className="form-check-label fw-semibold" style={{ fontSize: "14px" }}>
                Hospital
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                type="radio"
                className="form-check-input"
                name="role"
                id="organisationRadio"
                value="organisation"
                checked={role === "organisation"}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="organisationRadio" className="form-check-label fw-semibold" style={{ fontSize: "14px" }}>
                Organisation
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                type="radio"
                className="form-check-input"
                name="role"
                id="adminRadio"
                value="admin"
                checked={role === "admin"}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="adminRadio" className="form-check-label fw-semibold" style={{ fontSize: "14px" }}>
                Admin
              </label>
            </div>
          </div>
        </div>

        {/* Dynamic Form Inputs */}
        {formType === "login" ? (
          <>
            <InputType
              labelText="Email Address"
              labelFor="loginEmail"
              inputType="email"
              name="email"
              placeholder="e.g. user@gmail.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputType
              labelText="Password"
              labelFor="loginPassword"
              inputType="password"
              name="password"
              placeholder="Enter your account password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        ) : (
          <>
            {(role === "admin" || role === "donar") && (
              <InputType
                labelText="Full Name"
                labelFor="forName"
                inputType="text"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />
            )}
            {role === "organisation" && (
              <InputType
                labelText="Organisation Name"
                labelFor="forOrganisationName"
                inputType="text"
                name="organisationName"
                placeholder="e.g. Red Cross Blood Center"
                value={organisationName}
                required
                onChange={(e) => setOrganisationName(e.target.value)}
              />
            )}
            {role === "hospital" && (
              <InputType
                labelText="Hospital / Clinic Name"
                labelFor="forHospitalName"
                inputType="text"
                name="hospitalName"
                placeholder="e.g. Apollo Multi-Specialty Hospital"
                value={hospitalName}
                required
                onChange={(e) => setHospitalName(e.target.value)}
              />
            )}

            <InputType
              labelText="Official Email (Verification Receipt Sent Here)"
              labelFor="forEmail"
              inputType="email"
              name="email"
              placeholder="e.g. contact@gmail.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputType
              labelText="Password"
              labelFor="forPassword"
              inputType="password"
              name="password"
              placeholder="Create a secure password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />

            <InputType
              labelText="Mobile / Contact Phone"
              labelFor="forPhone"
              inputType="tel"
              name="phone"
              placeholder="e.g. +91 9876543210"
              value={phone}
              required
              onChange={(e) => setPhone(e.target.value)}
            />

            <InputType
              labelText="Complete Address / Facility Location"
              labelFor="forAddress"
              inputType="text"
              name="address"
              placeholder="City, State, Postal Code"
              value={address}
              required
              onChange={(e) => setAddress(e.target.value)}
            />

            {(role === "hospital" || role === "organisation") && (
              <InputType
                labelText="Website URL (Optional)"
                labelFor="forWebsite"
                inputType="url"
                name="website"
                placeholder="https://yourhospital.org"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            )}

            <div className="alert alert-light border py-2 px-3 small text-muted my-2">
              🛡️ <em>An official verification receipt will be dispatched to your email with account confirmation.</em>
            </div>
          </>
        )}

        {/* Submit & Navigation Links */}
        <div className="mt-3">
          <button
            className="btn w-100 fw-bold py-2 text-white shadow-sm"
            type="submit"
            style={{ backgroundColor: "#b01826" }}
          >
            {submitBtn}
          </button>
        </div>

        <div className="text-center mt-3 small">
          {formType === "login" ? (
            <span className="text-muted">
              Don't have an account yet?{" "}
              <Link to="/register" className="fw-bold" style={{ color: "#b01826" }}>
                Register here
              </Link>
            </span>
          ) : (
            <span className="text-muted">
              Already registered?{" "}
              <Link to="/login" className="fw-bold" style={{ color: "#b01826" }}>
                Login here
              </Link>
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default Form;
