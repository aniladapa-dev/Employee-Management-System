const FooterComponent = () => {
  return (
    <footer className="bg-dark text-light py-3 mt-5">
      <div className="container text-center">
        <small>
          © {new Date().getFullYear()} EMS • Built with Spring Boot & React
        </small>
      </div>
    </footer>
  );
};

export default FooterComponent;
