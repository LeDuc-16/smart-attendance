import React from 'react'

const LoginPage = () => {
  return (
    <>
      <h1>Login</h1>
      <form>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Enter your password" />
        </div>
        <button>Login</button>
      </form>
    </>
  )
}

export default LoginPage