"use client";

import LazyImageGrid from "@/components/LazyImageGrid";
import { useState } from "react";

export default function TestPage() {
  const [imageFileIds, setImageFileIds] = useState([
    "1C8UUNge-NQt3C1s0oxmuIcdTFDtHSNOm",
    "1kBdKZaLsMGaR-FROJmRacvq348YGzW7j",
    "1ZXLjxlFUNMbX1YjkrmZp9SN9TNAsgh-P",
    "19YFenidk7dvqhbTmb7QiJzPskU_MuC18",
    "1zB8ztlR_X98nsxUJBL0mm19NA9zVngfr",
    "1uad62BNgfiNwY6AMrJE9zcgY4f7sk9_r",
    "1bbmLL_pwkS-8qqKfO1EKOY91HbS0irDO",
    "13aZqVcu_L65pe8_H2bBEu3-y7L76aE7o",
    "19TyCVUxDVrCkBvZADJ0sBG_tY5n_1Vcv",
    "1t8REDY1Hr6-hbYe3yfouGD9IlUiiP0CT",
    "13n-IdPD1CTKEDUa8s0I3XFk8kEC928DN",
    "1-7qZdn6LWR08se-IgVlwIhWSy2WUIq3G",
    "1d4rOHkaSIHjEEu6xSorF2Uzjn4ioo1JA",
    "1goukd97Vc1JQY_7MgRR3l-DI06pAcCYV",
    "1bYjYeKg5aEMojJLgjcq-P1DuM6hFGozQ",
    "1OepOHPBZgR3q2pYa_peOdGx2Yu3PMlT_",
  ]);
  const [removedIds, setRemovedIds] = useState([]);

  const handleRemoveImage = (id) => {
    setRemovedIds((prev) => [...prev, id]);
    setImageFileIds((prev) => prev.filter((fileId) => fileId !== id));
  };

  return (
    <div className="flex flex-grow items-center justify-center bg-gray-100">
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Test LazyImageGrid</h1>
        <LazyImageGrid
          fileIds={imageFileIds}
          onRemove={handleRemoveImage}
          deletable={true}
        />
        <div className="mt-6">
          <h2 className="text-xl font-bold">Removed IDs:</h2>
          <ul className="list-disc pl-6">
            {removedIds.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
          <h2 className="text-xl font-bold mt-4">Remaining IDs:</h2>
          <ul className="list-disc pl-6">
            {imageFileIds.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
