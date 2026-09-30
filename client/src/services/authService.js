import { userLogin, userRegister } from "../redux/features/auth/authActions";
import store from "../redux/store";
import { toast } from "react-toastify";

export const handleLogin = (e, email, password, role) => {
  e.preventDefault();
  try {
    if (!role || !email || !password) {
      return toast.warning("Please provide all fields");
    }
    store.dispatch(userLogin({ email, password, role }));
  } catch (error) {
    console.log(error);
  }
};

export const handleRegister = (
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
) => {
  e.preventDefault();
  try {
    if (!email || !password || !role || !address || !phone) {
      return toast.warning("Please provide all required fields");
    }
    if ((role === "donar" || role === "admin") && !name) {
      return toast.warning("Please provide name");
    }
    if (role === "organisation" && !organisationName) {
      return toast.warning("Please provide organisation name");
    }
    if (role === "hospital" && !hospitalName) {
      return toast.warning("Please provide hospital name");
    }

    store.dispatch(
      userRegister({
        name,
        role,
        email,
        password,
        phone,
        organisationName,
        address,
        hospitalName,
        website,
      })
    );
  } catch (error) {
    console.log(error);
  }
};

