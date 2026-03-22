const FooterComponent = () => {
  return (
    <footer className="py-5 mt-auto bg-dark text-white-50 border-top border-secondary border-opacity-10">
      <div className="container text-center">
        <div className="mb-3">
            <span className="fw-bold text-white fs-5">EMS</span>
        </div>
        <p className="small mb-0">
          © {new Date().getFullYear()} Employment Management System. All Rights Reserved.
        </p>
        <div className="mt-2 small opacity-50">
           Enterprise Grade • Secure • Scalable
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
