import React, { useEffect, useState } from "react";
import forge from "node-forge";
import { Upload, message, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthHeader, useAuthUser, useIsAuthenticated } from "react-auth-kit";

const { Dragger } = Upload;
const CheckHash = (props) => {
  const [hash, setHash] = useState([]);
  const [currentFileHash, setCurrentFileHash] = useState([]);
  const [checkFile, setCheckFile] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const nav = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const useAuth = useAuthHeader();
  const auth = useAuthUser();

  const handleFileUpload = async (file) => {
    setCurrentFileHash(null);
    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      // convert to a string array to compare with DB
      setFileUploaded(true);
      const arrayBuffer = e.target.result;
      const uint8Array = new Uint8Array(arrayBuffer);
      const array = Array.from(uint8Array);
      setCheckFile(array);
    };
    fileReader.readAsArrayBuffer(file);
  };

  const getFileHash = async () => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    let url = "/api/hash";

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: useAuth(),
      },
      data: {
        moreStuff: 54,
        fileID: props.file._id,
      },
      url: url,
    };
    const res = await axios(options)
      .then((response) => {
        if (response.status === 200) {
          setHash(response.data.hash);
        }
      })
      .catch((err) => {
        message.error("No File");
        console.log(err);
      });
  };

  const checkHash = () => {
    setFileUploaded(false);
    var newHash = forge.md.sha256.create();
    newHash.update(checkFile);
    const uploadedFileHash = newHash.digest().toHex();
    setCurrentFileHash(uploadedFileHash);
    if (uploadedFileHash === hash) {
      message.success("File is Valid");
    } else {
      message.error("File is Invalid");
    }
  };

  const draggerProps = {
    name: "file",
    showUploadList: false,
    customRequest: (options) => {
      const formData = new FormData();
      formData.append("file", options.file);
      handleFileUpload(options.file);
      options.onSuccess();
    },
  };

  useEffect(() => {
    getFileHash();
  }, []);

  return (
    <div>
      <h2> File Hash:</h2>
      <p>{hash}</p>
      <h2> UserFile:</h2>
      <p>{currentFileHash}</p>
      <>
        <Dragger {...draggerProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to check Hash</p>
          {fileUploaded && <h1 className="ant-upload-hint">File added</h1>}
        </Dragger>

        <Button onClick={checkHash}> Submit </Button>
      </>
    </div>
  );
};

export default CheckHash;
