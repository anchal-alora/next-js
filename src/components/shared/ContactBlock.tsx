import Link from "next/link";

const EMAIL = "sales@aloraadvisory.com";
const PHONE_IRELAND = "+353 87 457 1343";
const PHONE_INDIA = "+91 704 542 4192";

function toTel(value: string) {
  return value.replace(/\s+/g, "");
}

export function ContactBlock() {
  return (
    <p className="mt-10 text-base text-muted-foreground">
      <strong className="text-foreground">Contact</strong>
      <br />
      Email:{" "}
      <Link className="text-primary hover:underline" href={`mailto:${EMAIL}`}>
        {EMAIL}
      </Link>
      <br />
      Phone:{" "}
      <Link className="text-primary hover:underline" href={`tel:${toTel(PHONE_IRELAND)}`}>
        {PHONE_IRELAND}
      </Link>{" "}
      |{" "}
      <Link className="text-primary hover:underline" href={`tel:${toTel(PHONE_INDIA)}`}>
        {PHONE_INDIA}
      </Link>
    </p>
  );
}
