import { Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthHeader, useAuthUser, useIsAuthenticated } from "react-auth-kit";
import forge from "node-forge";

const ShareKey = () => {
  const nav = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const useAuth = useAuthHeader();
  const auth = useAuthUser();

  const shareKey = (value) => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    const url = "/api/keys/shareSymKey";
  };
  return <Button onClick={shareKey}> Share Key </Button>;
};

export default ShareKey;
