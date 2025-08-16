export default function getAddressString(address){
    const addressParts = [
      address.city,
      address.district,
      address.subregion,
      address.region,
      address.country,
    ].filter((part) => part && !part.includes("Unknown"));

    return addressParts.join(", ");
}