import React, { useState } from "react";
import { Upload, message, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import forge from "node-forge";
const { Dragger } = Upload;

const PEMUpload = (props) => {
  const [fileUploaded, setFileUploaded] = useState(false);

  const handlePemUpload = async (file) => {
    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      const privateKey = forge.pki.privateKeyFromPem(e.target.result);
      props.setPemString(forge.pki.privateKeyToPem(privateKey));
      setFileUploaded(true);
    };
    fileReader.readAsText(file);
  };

  const draggerProps = {
    name: "file",
    showUploadList: false,
    customRequest: (options) => {
      const formData = new FormData();
      formData.append("file", options.file);
      const fileExtension = options.file.name.split(".").pop();
      if (fileExtension !== "pem") {
        message.error("You can only upload PEM files!");
        return;
      }
      handlePemUpload(options.file);
      options.onSuccess();
    },
  };

  return (
    <div>
      <Dragger {...draggerProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">Please upload a PEM file.</p>
        {fileUploaded && <h1 className="ant-upload-hint">File added</h1>}
      </Dragger>
      {fileUploaded && (
        <>
          <Button
            onClick={() => {
              decryptFile(1);
            }}
          >
            Submit
          </Button>
          <Button onClick={() => decryptFile(2)}>
            Download Decrypted File
          </Button>
        </>
      )}
    </div>
  );
};

export default PEMUpload;
