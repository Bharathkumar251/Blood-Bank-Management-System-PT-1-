import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../../services/API";
import { toast } from "react-toastify";

// LOGIN
export const userLogin = createAsyncThunk(
  "auth/login",
  async ({ role, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/auth/login", { role, email, password });
      if (data.success) {
        localStorage.setItem("token", data.token);
        toast.success(data.message);
        window.location.replace("/");
      }
      return data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// REGISTER
export const userRegister = createAsyncThunk(
  "auth/register",
  async (
    {
      name,
      role,
      email,
      password,
      phone,
      organisationName,
      address,
      hospitalName,
      website,
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await API.post("/auth/register", {
        name,
        role,
        email,
        password,
        phone,
        organisationName,
        address,
        hospitalName,
        website,
      });
      if (data?.success) {
        const memberName =
          data.user?.name ||
          data.user?.hospitalName ||
          data.user?.organisationName ||
          name ||
          "Member";
        const userPhone = data.user?.phone || phone;
        const userEmail = data.user?.email || email;

        toast.success(
          `🎉 Registration Successful! Welcome, ${memberName}. Verification sent to ${userEmail} and alert dispatched to ${userPhone}`,
          { autoClose: 4000 }
        );

        setTimeout(() => {
          window.location.replace("/login");
        }, 2200);
      }
      return data;
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// GET CURRENT USER — Fixed: correct thunk signature (arg, { rejectWithValue })
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (arg, { rejectWithValue }) => {
    try {
      const res = await API.get("/auth/current-user");
      if (res.data) {
        return res?.data;
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
