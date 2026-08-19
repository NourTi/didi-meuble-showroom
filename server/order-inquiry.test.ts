import { describe, expect, it } from "vitest";
import { orderInquiryInput } from "./routers/storefront";

const validInquiry = {
  customerName: "Amina Benali",
  phone: "+213 699 29 80 59",
  wilaya: "El Oued",
  commune: "El Oued",
  address: "حي المصاعبة، قرب بلدية الوادي",
  productLabel: "غرفة نوم الواحة / Chambre Oasis",
  quantity: 1,
  notes: null,
};

describe("delivery inquiry validation", () => {
  it("accepts a well-formed order inquiry", () => {
    expect(orderInquiryInput.parse(validInquiry)).toMatchObject(validInquiry);
  });

  it("rejects invalid contact details and unsafe quantities", () => {
    expect(() => orderInquiryInput.parse({ ...validInquiry, phone: "call-me" })).toThrow();
    expect(() => orderInquiryInput.parse({ ...validInquiry, quantity: 21 })).toThrow();
  });

  it("requires distinct, usable delivery address fields", () => {
    expect(() => orderInquiryInput.parse({ ...validInquiry, wilaya: "" })).toThrow();
    expect(() => orderInquiryInput.parse({ ...validInquiry, commune: "X" })).toThrow();
    expect(() => orderInquiryInput.parse({ ...validInquiry, address: "short" })).toThrow();
  });
});
