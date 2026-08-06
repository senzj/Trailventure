import PropTypes from "prop-types";
import Footer from "./layouts/Footer";
import Header from "./layouts/Header";

function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
