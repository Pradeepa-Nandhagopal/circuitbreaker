
import { useState } from "react";
import "./App.css";

const PRODUCTS_API = "http://localhost:8081/api/products";
const INVENTORY_API = "http://localhost:8082/inventory";

export default function App() {
  const [username, setUsername] = useState("user");
  const [password, setPassword] = useState("");
  const [connected, setConnected] = useState(false);

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    productName: "",
    category: "",
    price: "",
    supplierId: "1"
  });

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: "Basic " + btoa(`${username}:${password}`)
  });

  // Fetch products and inventory
  async function refresh() {
    setError("");
    setMessage("");

    try {
      const [productResponse, inventoryResponse] =
          await Promise.all([
            fetch(PRODUCTS_API, { headers: headers() }),
            fetch(INVENTORY_API, { headers: headers() })
          ]);

      if (
          productResponse.status === 401 ||
          productResponse.status === 403 ||
          inventoryResponse.status === 401 ||
          inventoryResponse.status === 403
      ) {
        throw new Error(
            "Authentication failed. Check your Spring Security username and password."
        );
      }

      if (!productResponse.ok) {
        throw new Error(
            `Product API error: ${productResponse.status}`
        );
      }

      if (!inventoryResponse.ok) {
        throw new Error(
            `Inventory API error: ${inventoryResponse.status}`
        );
      }

      const productData = await productResponse.json();
      const inventoryData = await inventoryResponse.json();

      setProducts(
          Array.isArray(productData) ? productData : []
      );

      setInventory(
          Array.isArray(inventoryData) ? inventoryData : []
      );

      setConnected(true);
      setMessage("Dashboard data refreshed successfully.");

    } catch (e) {
      setError(
          e.message +
          " Ensure both Product Service and Inventory Service are running."
      );

      setConnected(false);
    }
  }

  // Add or update product
  async function save(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    const body = {
      productName: form.productName.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      supplierId: Number(form.supplierId)
    };

    if (
        !body.productName ||
        body.price <= 0 ||
        !Number.isFinite(body.price) ||
        body.supplierId <= 0
    ) {
      setError(
          "Enter a product name, positive price and valid supplier ID."
      );
      return;
    }

    try {
      const response = await fetch(
          editing
              ? `${PRODUCTS_API}/${editing}`
              : PRODUCTS_API,
          {
            method: editing ? "PUT" : "POST",
            headers: headers(),
            body: JSON.stringify(body)
          }
      );

      if (!response.ok) {
        throw new Error(
            `Save failed: HTTP ${response.status}. Check supplier ID and backend logs.`
        );
      }

      setMessage(
          editing ? "Product updated." : "Product added."
      );

      setEditing(null);

      setForm({
        productName: "",
        category: "",
        price: "",
        supplierId: "1"
      });

      await refresh();

    } catch (e) {
      setError(e.message);
    }
  }

  // Edit product
  function edit(p) {
    setEditing(p.productId);

    setForm({
      productName: p.productName || "",
      category: p.category || "",
      price: p.price ?? "",
      supplierId: String(p.supplierId ?? 1)
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // Delete product
  async function remove(p) {
    if (!window.confirm(`Delete ${p.productName}?`)) {
      return;
    }

    try {
      const response = await fetch(
          `${PRODUCTS_API}/${p.productId}`,
          {
            method: "DELETE",
            headers: headers()
          }
      );

      if (!response.ok && response.status !== 204) {
        throw new Error(
            `Delete failed: HTTP ${response.status}`
        );
      }

      setMessage("Product deleted.");
      await refresh();

    } catch (e) {
      setError(e.message);
    }
  }

  // Inventory calculations
  const stock = inventory;

  const total = stock.reduce(
      (sum, item) =>
          sum + (Number(item.quantity) || 0),
      0
  );

  // Login page
  if (!connected) {
    return (
        <main className="login">
          <section className="login-card">

            <div className="logo">SI</div>

            <p className="kicker">
              SMART INVENTORY MANAGEMENT
            </p>

            <h1>Welcome back</h1>

            <p className="muted">
              Connect to your Spring Boot services.
            </p>

            <form
                onSubmit={(e) => {
                  e.preventDefault();
                  refresh();
                }}
            >
              <label>Username</label>

              <input
                  value={username}
                  onChange={(e) =>
                      setUsername(e.target.value)
                  }
                  required
              />

              <label>Password</label>

              <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                      setPassword(e.target.value)
                  }
                  required
              />

              <button
                  className="primary wide"
                  type="submit"
                  disabled={!password}
              >
                Connect dashboard
              </button>
            </form>

            {error && (
                <p className="alert error">{error}</p>
            )}

            <p className="muted tiny">
              Product Service :8081 · Inventory Service :8082
            </p>

          </section>
        </main>
    );
  }

  // Main dashboard
  return (
      <div className="layout">

        <aside className="sidebar">

          <div className="brand">
            <span className="logo">SI</span>
            Stockwise
          </div>

          <p className="side-label">WORKSPACE</p>

          <div className="nav active">▦　Overview</div>
          <div className="nav">□　Products</div>
          <div className="nav">⇄　Inventory</div>
          <div className="nav">♙　Suppliers</div>

          <div className="side-bottom">
            <span className="green-dot" />
            Connected

            <button
                onClick={() => {
                  setConnected(false);
                  setPassword("");
                  setError("");
                  setMessage("");
                }}
            >
              Log out
            </button>
          </div>

        </aside>

        <main className="main">

          <header className="header">

            <div>
              <p className="kicker">INVENTORY CONTROL</p>
              <h1>Dashboard overview</h1>
            </div>

            <button
                className="secondary"
                onClick={refresh}
            >
              ↻ Refresh
            </button>

          </header>

          {error && (
              <p className="alert error">{error}</p>
          )}

          {message && (
              <p className="alert success">{message}</p>
          )}

          {/* Statistics */}
          <section className="stats">

            <article>
              <span className="tile purple">▦</span>
              <p>Total products</p>
              <strong>{products.length}</strong>
              <small>Products in database</small>
            </article>

            <article>
              <span className="tile blue">▤</span>
              <p>Inventory item types</p>
              <strong>{stock.length}</strong>
              <small>Tracked stock categories</small>
            </article>

            <article>
              <span className="tile green">⌁</span>
              <p>Total stock units</p>
              <strong>{total}</strong>
              <small>Across listed inventory</small>
            </article>

          </section>

          {/* Product Form */}
          <section className="panel">

            <div className="panel-title">

              <div>
                <p className="kicker">CATALOG MANAGEMENT</p>

                <h2>
                  {editing ? "Update product" : "Add a product"}
                </h2>
              </div>

              {editing && (
                  <button
                      className="link"
                      onClick={() => {
                        setEditing(null);

                        setForm({
                          productName: "",
                          category: "",
                          price: "",
                          supplierId: "1"
                        });
                      }}
                  >
                    Cancel edit
                  </button>
              )}

            </div>

            <form className="product-form" onSubmit={save}>

              <div>
                <label>Product name</label>

                <input
                    required
                    placeholder="Laptop"
                    value={form.productName}
                    onChange={(e) =>
                        setForm({
                          ...form,
                          productName: e.target.value
                        })
                    }
                />
              </div>

              <div>
                <label>Category</label>

                <input
                    placeholder="Electronics"
                    value={form.category}
                    onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value
                        })
                    }
                />
              </div>

              <div>
                <label>Price (₹)</label>

                <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="55000"
                    value={form.price}
                    onChange={(e) =>
                        setForm({
                          ...form,
                          price: e.target.value
                        })
                    }
                />
              </div>

              <div>
                <label>Supplier ID</label>

                <input
                    required
                    type="number"
                    min="1"
                    value={form.supplierId}
                    onChange={(e) =>
                        setForm({
                          ...form,
                          supplierId: e.target.value
                        })
                    }
                />
              </div>

              <button className="primary" type="submit">
                {editing ? "Save changes" : "+ Add product"}
              </button>

            </form>

          </section>

          {/* Products and Inventory */}
          <section className="columns">

            {/* Products */}
            <section className="panel">

              <div className="panel-title">

                <div>
                  <p className="kicker">DATABASE RECORDS</p>
                  <h2>Products</h2>
                </div>

                <span className="pill">
                {products.length} records
              </span>

              </div>

              {!products.length ? (
                  <p className="empty">
                    No products found.
                  </p>
              ) : (

                  <div className="table-wrap">

                    <table>

                      <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Supplier</th>
                        <th>Actions</th>
                      </tr>
                      </thead>

                      <tbody>

                      {products.map((p) => (

                          <tr key={p.productId}>

                            <td>
                              <b>{p.productName}</b>
                              <small>ID: {p.productId}</small>
                            </td>

                            <td>{p.category || "—"}</td>

                            <td>
                              ₹{Number(p.price).toLocaleString("en-IN")}
                            </td>

                            <td>{p.supplierId ?? "—"}</td>

                            <td className="actions">

                              <button onClick={() => edit(p)}>
                                Edit
                              </button>

                              <button
                                  className="delete"
                                  onClick={() => remove(p)}
                              >
                                Delete
                              </button>

                            </td>

                          </tr>

                      ))}

                      </tbody>

                    </table>

                  </div>

              )}

            </section>

            {/* Inventory */}
            <section className="panel">

              <div className="panel-title">

                <div>
                  <p className="kicker">LIVE STOCK SNAPSHOT</p>
                  <h2>Inventory</h2>
                </div>

                <span className="pill">
                {stock.length} items
              </span>

              </div>

              {!stock.length ? (
                  <p className="empty">
                    No inventory data returned.
                  </p>
              ) : (

                  stock.map((item) => {

                    const product = products.find(
                        (p) =>
                            Number(p.productId) ===
                            Number(item.productId)
                    );

                    return (
                        <div
                            className="stock"
                            key={item.inventoryId}
                        >

                          <div>
                            <b>
                              {product?.productName ||
                                  `Product #${item.productId}`}
                            </b>

                            <small>
                              {Number(item.quantity) <=
                              Number(item.reorderLevel)
                                  ? "Low stock"
                                  : "In stock"}
                            </small>
                          </div>

                          <strong>{item.quantity}</strong>

                        </div>
                    );

                  })

              )}

              <p className="muted tiny">
                Live data from Inventory Service and MySQL.
              </p>

            </section>

          </section>

          <footer>
            Smart Inventory Management · React + Spring Boot Microservices
          </footer>

        </main>

      </div>
  );
}
