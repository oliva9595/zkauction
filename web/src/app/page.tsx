import AuctionDashboard from "@/components/AuctionDashboard";

export default function Home() {
  return (
    <div id="top" className="flex flex-col items-center justify-center pt-8 md:pt-12">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500">
          Private Sealed-Bid Auctions
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Submit bids with zero-knowledge proofs. Reveal the winner and the clearing price without exposing losing bids. Secure, private, and fair.
        </p>
      </div>
      
      <AuctionDashboard />
    </div>
  );
}
