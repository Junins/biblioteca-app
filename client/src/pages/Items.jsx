import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function Items() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get("/items").then((res) => setItems(res.data));
  }, []);

  const remove = async (id) => {
    await axios.delete(`/items/${id}`);
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div>
      <h2>Itens</h2>

      <ul>
        {items.map((i) => (
          <li key={i.id}>
            {i.name} — {i.description}

            {user?.role === "admin" && (
              <button onClick={() => remove(i.id)}>Remover</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
