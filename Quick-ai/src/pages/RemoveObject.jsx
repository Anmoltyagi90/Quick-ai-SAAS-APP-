import { Scissors, Sparkles } from "lucide-react";
import React, { useState } from "react";

const RemoveObject = () => {
  const [input, setInput] = useState("");
  const [object, setObject] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
  };
  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Background Removal</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upolad image</p>
        <input
          onChange={(e) => setInput(e.target.files[0])}
          type="file"
          accept="image/*"
          className="p-2 border w-full rounded-lg px-3 mt-1 outline-none text-sm border-gray-300 text-gray-600"
          required
        />

        <p className="mt-6 text-sm font-medium">Describe Object to remove</p>
        <textarea
          value={object}
          onChange={(e) => setObject(e.target.value)}
          rows={4}
          placeholder="e.g., watch or spoon, only single object name "
          className="p-2 border w-full rounded-lg mt-1 outline-none text-sm border-gray-300"
          required
        />

        <p className="text-sm text-gray-500 font-medium mt-1">
          Be specific about what you want to remove
        </p>

        <button className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer">
          <Scissors className="w-5" />
          Remove Object
        </button>
      </form>

      <div className="bg-white shadow-md rounded-lg border border-gray-200 w-full max-w-lg min-h-[420px] flex flex-col p-5">
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-3">
          <Scissors className="w-5 h-5 text-[#4A7AFF]" />
          <h1 className="text-lg font-semibold text-gray-700">
            Processed Image
          </h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex justify-center items-center">
          <div className="text-sm flex flex-col items-center gap-4 text-gray-400 text-center">
            <Scissors className="w-10 h-10" />
            <p>Enter a Topic and click Generate Eraser to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveObject;
