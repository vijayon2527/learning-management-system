  import React, { useContext } from 'react'
  import { Navigate } from 'react-router-dom';
  import 'react-toastify/dist/ReactToastify.css';
  import BioSection from '../../common/biosection/BioSection';
  import AuthContext from '../../context/AuthContext';


  const Login = () => {
  let {user, logoutUser} = useContext(AuthContext)

    let {loginUser} = useContext(AuthContext)
    return (
      <section>
      <BioSection />
        {
        !user?(
          <>
            <div className='container'>
              <div className='col-md-6 mx-auto'>
                <h1 className='text-center'>Login</h1>
                <form onSubmit={loginUser}>
                  <div className="mb-3">
                    <label className="form-label">Email address</label>
                    <input type="email" 
                    name="email"
                    className="form-control" 
                    placeholder="Email" 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" 
                    name="password"
                    className="form-control" 
                    placeholder="Password" 
                    />
                  </div>
                  <button className='btn btn-primary w-100'>Submit</button>
                </form>
              </div>
            </div>
          </>):<Navigate to="/"/>
        }
      </section>
    )
  }

  export default Login