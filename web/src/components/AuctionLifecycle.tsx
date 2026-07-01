const stages = [
  ["Bid", "Create a private commitment in the browser."],
  ["Lock", "Escrow the bid asset on Stellar."],
  ["Prove", "Verify the Noir UltraHonk settlement proof."],
  ["Pay", "Finalize the winner, refunds, and clearing price."],
] as const;

export default function AuctionLifecycle() {
  return (
    <section id="protocol" className="protocol-section">
      <div className="section-heading">
        <span>Protocol lifecycle</span>
        <h2>Privacy where it matters. Proof where it counts.</h2>
      </div>
      <ol className="lifecycle">
        {stages.map(([title, body], index) => (
          <li key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
