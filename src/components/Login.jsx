import React from "react";

const Login = () => {
  return (
    <section className="px-3">
      <div className="row">
        <div className="col-lg-6">
          <div className="login-area">
            <h2>Sign Up</h2>
            <p>welcome please login to your account</p>

            <form>
              <button className="btn google-btn w-100">
                Sign in with Google
              </button>

              <input type="text" placeholder="First Name" />
              <input type="text" placeholder="Last Name" />
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />

              <button type="submit">Login</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;