import { useUser } from "@clerk/clerk-react";
import React, { useEffect, useState } from "react";
import { dummyPublishedCreationData } from "../assets/assets";
import { Heart } from "lucide-react";

const Community = () => {
  const [creations, setCreations] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      setCreations(dummyPublishedCreationData);
    }
  }, [user]);

  return (
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      <h2 className="text-xl font-semibold">Creations</h2>

      <div className="bg-white h-full w-full rounded-xl overflow-y-auto flex flex-wrap">
        {creations.map((creation, index) => (
          <div
            key={index}
            className="relative group p-3 w-full sm:w-1/2 lg:w-1/3"
          >
            <img
              src={creation.content}
              alt="creation"
              className="w-full h-95 object-cover rounded-lg"
            />

            <div className="absolute inset-3 flex items-end justify-end group-hover:justify-between p-3 bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition">
              <p className="text-sm max-w-[70%]">
                {creation.prompt}
              </p>

              <div className="flex gap-1 items-center">
                <p>{creation.likes.length}</p>
                <Heart
                  className={`w-5 h-5 cursor-pointer hover:scale-110 transition ${
                    creation.likes.includes(user?.id)
                      ? "fill-red-500 text-red-600"
                      : "text-white"
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
