import { useState } from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://youchatbackend.onrender.com";

const Form = ({
    isSignInPage = true,
}) => {
    const [data,setData] = useState({
        ...(!isSignInPage && {
            fullName: ''
        }),
        email:'',
        password:''
    });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const res = await fetch(`${BASE_URL}/api/${isSignInPage ? 'login' : 'register'}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
          });
  
          if (res.status === 400) {
              const errorMessage = await res.text();
              alert(`Invalid Credentials: ${errorMessage}`);
          } else if (!res.ok) {
              const errorMessage = await res.text();
              alert(`Error: ${errorMessage}`);
          } else {
              let resData;
              const contentType = res.headers.get('content-type');
              if (contentType && contentType.indexOf('application/json') !== -1) {
                  resData = await res.json();
              } else {
                  resData = await res.text();
              }
  
              console.log(resData);
  
              if (resData.token) {
                  localStorage.setItem('user:token', resData.token);
                  localStorage.setItem('user:detail', JSON.stringify(resData.user));
                  navigate('/');
              } else {
                  alert('User registered successfully!');
                  navigate('/users/sign_in');
              }
          }
      } catch (error) {
          console.error('Error during fetch:', error);
          alert('An error occurred. Please try again.');
      }
  };

  return (
    <div className="bg-light h-screen flex items-center justify-center">
      <div className="bg-white w-[550px] h-[600px] shadow-lg rounded-lg flex flex-col justify-center items-center">
        <div className="text-4xl font-bold">Welcome {isSignInPage && "Back"}</div>
        <div className="text-xl font-light mb-14">{isSignInPage ? 'Sign in to explore' : 'Sign up to get started' }</div>
        <form className="flex flex-col items-center w-full" onSubmit={(e) => handleSubmit(e)}>
          {!isSignInPage && <Input value={data.fullName} onChange={(e) => setData({...data, fullName: e.target.value })} className="mb-6  w-[50%]" label="Full name" name="name" placeholder="Enter your Full name"  /> }
          <Input value={data.email} onChange={(e) => setData({...data, email: e.target.value })} className="mb-6 w-[50%]" label="Email address" type="email" name="email" placeholder="Enter your email"  />
          <Input value={data.password} onChange={(e) => setData({...data, password: e.target.value })} className=" w-[50%] mb-14" label="Password" type="password" name="password" placeholder="Enter your Password"  />
          <Button type="submit" className=" w-[50%] mb-2" label={isSignInPage ? 'Sign in' : 'Sign up'} />
        </form>
        <div>
            {isSignInPage ? "Don't have an account?" : 'Already have an account?' } <span onClick={() => navigate(`/users/${isSignInPage ? 'sign_up' : 'sign_in'}`)} className="text-primary cursor-pointer underline">{isSignInPage ? 'Sign up' : 'Sign in'}</span>
        </div>
    </div>
    </div>
  )
}

export default Form;
