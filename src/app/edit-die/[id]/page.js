"use client";

import { use } from "react";
import UpdateDieForm from "@/components/dies/UpdateDieForm";

export default function EditDiePage(props) {
  const params = use(props.params);

  if (!params?.id) {
    return <p className="text-red-500">Invalid ID parameter.</p>;
  }

  return <UpdateDieForm dieId={params.id} />;
}
