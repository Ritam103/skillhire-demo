"use client";

import dynamic from "next/dynamic";

const SkillHireDemo = dynamic(() => import("./SkillHireDemo"), { ssr: false });

export default function Page() {
  return <SkillHireDemo />;
}


