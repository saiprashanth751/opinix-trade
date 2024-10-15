interface EventCardProps {
  icon: string;
  traders: number;
  question: string;
  yesValue: number;
  noValue: number;
}

export const EventCard = ({
  icon,
  traders,
  question,
  yesValue,
  noValue,
}: EventCardProps) => (
  <div className="rounded-lg shadow-lg p-4 flex flex-col justify-between bg-white">
    <div className="flex flex-col mb-2">
      <img src={icon} alt="Event icon" className="w-10 h-10 mr-4" />
      <div className="flex mt-2">
        <img src="/assets/trade-icon.png" alt="" className="w-5 h-5" />
        <div className="text-gray-500 text-xs mt-0.5">{traders} traders</div>
      </div>
    </div>
    <h3 className="font-semibold mb-4">{question}</h3>
    <div className="flex justify-between">
      <button className="bg-blue-100 text-blue-600 px-6 py-2 rounded font-bold">
        Yes ₹{yesValue}
      </button>
      <button className="bg-red-100 text-red-600 px-6 py-2 rounded font-bold">
        No ₹{noValue}
      </button>
    </div>
  </div>
);
