import React, { useEffect } from "react";
import Form from "../../components/shared/Form/Form";
import { useSelector } from "react-redux";
import Spinner from "./../../components/shared/Spinner";
import { toast } from "react-toastify";

const Login = () => {
  const { loading, error } = useSelector((state) => state.auth);

  // Fixed: show error via toast in useEffect instead of alert() inside JSX render
  // (alert() inside JSX fires during render, causing repeated popup loops)
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="row g-0">
          <div className="col-md-8 form-banner">
            <img src="./assets/images/banner1.jpg" alt="loginImage" />
          </div>
          <div className="col-md-4 form-container">
            <Form
              formTitle={"Login"}
              submitBtn={"Login"}
              formType={"login"}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
