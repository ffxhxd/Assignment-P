const Button = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 md:py-3 md:px-6 rounded"
    >
      Save
    </button>
  );
};

export default Button;
