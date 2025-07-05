export default function TestStyles() {
  return (
    <div className="p-8 bg-red-500 text-white">
      <h1 className="text-4xl font-bold mb-4">CSS Test Page</h1>
      <p className="text-lg mb-4">If you can see this text in white on a red background, Tailwind CSS is working.</p>
      <div className="bg-blue-500 p-4 rounded-lg">
        <p>This should be blue with rounded corners and padding.</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-green-500 p-4 text-center">Green</div>
        <div className="bg-yellow-500 p-4 text-center">Yellow</div>
        <div className="bg-purple-500 p-4 text-center">Purple</div>
      </div>
    </div>
  );
}
