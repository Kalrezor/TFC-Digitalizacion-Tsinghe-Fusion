/*
 * Archivo: src/components/SplitBillForm.js
 * Proposito: Herramienta para dividir una cuenta entre comensales.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

// Componente: SplitBillForm.js
import React, { useState } from "react";

const SplitBillForm = () => {
  const [total, setTotal] = useState("");
  const [people, setPeople] = useState("");

  // CÃ¡lculos dinÃ¡micos en tiempo real basados en los inputs
  const totalAmount = parseFloat(total) || 0;
  const numberOfPeople = parseInt(people) || 1;
  const perPerson = numberOfPeople > 0 ? (totalAmount / numberOfPeople).toFixed(2) : "0.00";

  return (
    <div style={{ padding: "60px 40px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Encabezado Editorial */}
      <div style={{ marginBottom: "40px", borderBottom: "1px solid #050505", paddingBottom: "16px" }}>
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "32px",
            fontWeight: "400",
            color: "#050505",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          Dividir Cuenta 
        </h2>
        <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#71717a", marginTop: "6px" }}>
          Herramienta de cÃ¡lculo rÃ¡pido â€¢ Tsinghe FusiÃ³n
        </p>
      </div>

      {/* Grid de Dos Columnas para abarcar el espacio de la pantalla */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "50px",
          alignItems: "start",
        }}
      >
        {/* COLUMNA IZQUIERDA: ConfiguraciÃ³n de la cuenta */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Input: Importe Total */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: "700", color: "#050505" }}>
              Importe Total de la Cuenta (â‚¬)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              style={{
                padding: "18px",
                border: "1px solid #050505",
                fontSize: "16px",
                outline: "none",
                background: "#fff",
                fontFamily: "monospace",
              }}
            />
          </div>

          {/* Input: NÃºmero de comensales */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: "700", color: "#050505" }}>
              NÃºmero de Personas
            </label>
            <input
              type="number"
              min="1"
              placeholder="1"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              style={{
                padding: "18px",
                border: "1px solid #050505",
                fontSize: "16px",
                outline: "none",
                background: "#fff",
                fontFamily: "monospace",
              }}
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: Recibo y Desglose de resultados */}
        <div
          style={{
            border: "1px solid #050505",
            background: "#fff",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "260px",
            boxShadow: "6px 6px 0px 0px #050505", // Sombreado rÃ­gido de estilo editorial moderno
          }}
        >
          {/* Desglose de conceptos */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #ccc", paddingBottom: "12px" }}>
              <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#71717a" }}>Total de la mesa</span>
              <span style={{ fontSize: "15px", fontFamily: "monospace", fontWeight: "600" }}>{totalAmount.toFixed(2)} â‚¬</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "4px" }}>
              <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#71717a" }}>Dividido entre</span>
              <span style={{ fontSize: "15px", fontFamily: "monospace", fontWeight: "600" }}>{people || 1} {numberOfPeople === 1 ? "persona" : "personas"}</span>
            </div>
          </div>

          {/* Gran bloque del resultado final */}
          <div
            style={{
              marginTop: "30px",
              padding: "32px 20px",
              background: "#fafafa",
              border: "1px solid #050505",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#71717a",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Cada persona debe pagar
            </p>
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "48px",
                color: "#050505",
                margin: 0,
                fontWeight: "400",
              }}
            >
              {perPerson} â‚¬
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SplitBillForm;
