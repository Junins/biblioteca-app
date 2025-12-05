import { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await axios.post("/auth/login", form);
    setUser(res.data);
    navigate("/");
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        placeholder="Usuário"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />

      <input
        type="password"
        placeholder="Senha"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
}
