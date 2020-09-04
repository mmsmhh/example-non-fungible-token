import React, { useState, useEffect } from "react";
import Computer from "bitcoin-computer";
import "./App.css";
import Loan from "./loan";

function App() {
  const [computer, setComputer] = useState(
    new Computer({
      seed:
        "title mercy exhibit wasp diesel tell state snow swamp benefit electric admit",
      chain: "BSV",
    })
  );
  const [balance, setBalance] = useState(0);

  const [amount, setAmount] = useState(0);
  const [borrowerName, setBorrowerName] = useState("");
  const [lenderName, setLenderName] = useState("");

  const [revs, setRevs] = useState([]);
  const [loans, setLoans] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const fetchRevs = async () => {
      setBalance(await computer.db.wallet.getBalance());
      setRevs(await computer.getRevs(computer.db.wallet.getPublicKey()));
      setTimeout(() => setRefresh(!refresh), 5500);
    };
    fetchRevs();
  }, [computer, computer.db.wallet, refresh]);

  useEffect(() => {
    const fetchLoans = async () => {
      await setLoans(
        await (
          await Promise.all(revs.map(async (rev) => computer.sync(rev)))
        ).filter(
          (loan) =>
            loan.amount != null &&
            loan.borrowerName != null &&
            loan.lenderName != null
        )
      );
    };
    fetchLoans();
  }, [revs, computer]);

  useEffect(() => {
    if (loader) {
      setLoader(false);
      setAmount(0);
      setBorrowerName("");
      setLenderName("");
    }
  }, [loans]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!(amount > 0)) {
      alert("Please enter amount more than 0.");
      return;
    }

    if (borrowerName.length < 1) {
      alert("Borrower Name can't be empty.");
      return;
    }
    if (lenderName.length < 1) {
      alert("Lender Name can't be empty.");
      return;
    }

    try {
      await computer.new(Loan, [amount, borrowerName, lenderName]);
      setLoader(true);
    } catch (err) {
      alert(err);
    }
    // console.log("created loan", loan);
  };

  return (
    <div className="App">
      <h2>Wallet</h2>
      <b>Address</b>&nbsp;{computer.db.wallet.getAddress().toString()}
      <br />
      <b>Public Key</b>&nbsp;{computer.db.wallet.getPublicKey().toString()}
      <br />
      <b>Balance</b>&nbsp;{balance / 1e8} {computer.db.wallet.restClient.chain}
      <br />
      <button type="submit" onClick={() => setComputer(new Computer())}>
        Generate New Wallet
      </button>
      <h2>Create new Loan</h2>
      <form onSubmit={handleSubmit}>
        <b>Amount</b>
        <br />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <b>Borrower Name</b>
        <br />
        <input
          type="text"
          value={borrowerName}
          onChange={(e) => setBorrowerName(e.target.value)}
        />
        <b>Lender Name</b>
        <br />
        <input
          type="text"
          value={lenderName}
          onChange={(e) => setLenderName(e.target.value)}
        />
        <button type="submit" value="Create loan" disabled={loader}>
          Create Loan
        </button>
      </form>
      <h2>Your Loans</h2>
      <div className="table">
        {loader ? (
          <div className="loader"></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Borrower Name</th>
                <th>Lender Name</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.amount + loan.borrowerName + loan.lenderName}>
                  <td>{loan.amount}</td>
                  <td>{loan.borrowerName}</td>
                  <td>{loan.lenderName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
