import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

export function BeltIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21.5,10.5H18.92L16.27,6.13A1,1,0,0,0,15.4,5.5H8.6A1,1,0,0,0,7.73,6.13L5.08,10.5H2.5a1,1,0,0,0-1,1v1a1,1,0,0,0,1,1H5.08l2.65,4.37a1,1,0,0,0,.87.63h6.8a1,1,0,0,0,.87-.63L18.92,13.5H21.5a1,1,0,0,0,1-1v-1A1,1,0,0,0,21.5,10.5Zm-1.13,1H19.05l-2.12,3.5H7.07L4.95,11.5H3.63V11.5H4.95l2.12-3.5H16.93l2.12,3.5h1.32Z"/>
      <path d="M12,7.26,10.41,10H7.73L9.59,7.26a1,1,0,0,0,.14-1,1,1,0,0,0-.82-.63H7.07l2.12,3.5H5.08a1,1,0,0,0,0,2H9.19l-2.12,3.5H8.91a1,1,0,0,0,.82.63,1,1,0,0,0,.73-.3l1.54-2.54L13.59,17a1,1,0,0,0,.73.3,1,1,0,0,0,.82-.63h.16l-2.12-3.5h4.11a1,1,0,0,0,0-2H14.81l2.12-3.5h.16a1,1,0,0,0,.82.63,1,1,0,0,0,.73-.3L20.37,7a1,1,0,0,0-.14,1,1,1,0,0,0,.14,1h-2.68L16.27,6.13a1,1,0,0,0-.87-.63H8.6a1,1,0,0,0-.87.63L9.59,8.74,12,14.74l2.41-6Z" />
    </svg>
  );
}
