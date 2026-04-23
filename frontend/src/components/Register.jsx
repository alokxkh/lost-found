import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register', form);
      navigate('/login');
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="container center-screen">
      <div className="card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Name" required onChange={e => setForm({...form, name: e.target.value})} />
          <input type="email" placeholder="Email" required onChange={e => setForm({...form, email: e.target.value})} />
          <input type="password" placeholder="Password" required onChange={e => setForm({...form, password: e.target.value})} />
          <button type="submit" className="btn btn-primary">Register</button>
        </form>
        <p>Already registered? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}