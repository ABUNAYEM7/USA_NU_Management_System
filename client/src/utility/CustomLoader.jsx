// CustomLoader.jsx
import React from "react";
import { Orbit } from "@uiball/loaders";
import logo from '../../public/logo.jpg'

const CustomLoader = () => {
  return (
    <div style={styles.container}>
      <img
        src={logo}
        alt="logo"
        style={styles.image}
      />
      <div style={styles.spinner}>
        <Orbit size={100} color="#4fa94d" />
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    width: "120px",
    height: "120px",
    margin: "auto",
  },
  image: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1,
    width: "80px",
    height: "80px",
    borderRadius: "50%",
  },
  spinner: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 0,
  },
};

export default CustomLoader;
