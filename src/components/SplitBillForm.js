// Componente: SplitBillForm.js
import React, { useState } from "react";
import styles from "../styles/modules/SplitBillForm.module.css";

const SplitBillForm = () => {
  const [total, setTotal] = useState("");
  const [people, setPeople] = useState("");

  // Cálculos dinámicos en tiempo real basados en los inputs
  const totalAmount = parseFloat(total) || 0;
  const numberOfPeople = parseInt(people) || 1;
  const perPerson =
    numberOfPeople > 0 ? (totalAmount / numberOfPeople).toFixed(2) : "0.00";

  return (
    <div className={styles.container}>
      {/* Encabezado Editorial */}
      <div className={styles.header}>
        <h2 className={styles.title}>Dividir Cuenta</h2>
        <p className={styles.subtitle}>
          Herramienta de cálculo rápido • Tsinghe Fusión
        </p>
      </div>

      {/* Grid de Dos Columnas para abarcar el espacio de la pantalla */}
      <div className={styles.grid}>
        {/* COLUMNA IZQUIERDA: Configuración de la cuenta */}
        <div className={styles.leftColumn}>
          {/* Input: Importe Total */}
          <div className={styles.field}>
            <label className={styles.label}>
              Importe Total de la Cuenta (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className={styles.input}
            />
          </div>

          {/* Input: Número de comensales */}
          <div className={styles.field}>
            <label className={styles.label}>Número de Personas</label>
            <input
              type="number"
              min="1"
              placeholder="1"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: Recibo y Desglose de resultados */}
        <div className={styles.receipt}>
          {/* Desglose de conceptos */}
          <div className={styles.breakdown}>
            <div className={styles.breakdownRowDashed}>
              <span className={styles.breakdownLabel}>Total de la mesa</span>
              <span className={styles.breakdownValue}>
                {totalAmount.toFixed(2)} €
              </span>
            </div>

            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>Dividido entre</span>
              <span className={styles.breakdownValue}>
                {people || 1} {numberOfPeople === 1 ? "persona" : "personas"}
              </span>
            </div>
          </div>

          {/* Gran bloque del resultado final */}
          <div className={styles.resultBlock}>
            <p className={styles.resultLabel}>Cada persona debe pagar</p>
            <p className={styles.resultValue}>{perPerson} €</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitBillForm;
