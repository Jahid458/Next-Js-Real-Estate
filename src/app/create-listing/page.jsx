"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function CreateListing() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { id, type, checked, value, tagName } = e.target;

    if (id === "sale" || id === "rent") {
      setFormData({ ...formData, type: id });
      return;
    }

    if (id === "parking" || id === "furnished" || id === "offer") {
      setFormData({ ...formData, [id]: checked });
      return;
    }

    if (type === "number") {
      setFormData({ ...formData, [id]: Number(value) });
      return;
    }

    if (type === "text" || tagName === "TEXTAREA") {
      setFormData({ ...formData, [id]: value });
      return;
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Discount validation
    if (formData.offer && formData.discountPrice >= formData.regularPrice) {
      setLoading(false);
      return setError("Discount price must be less than regular price");
    }

    try {
      // Send to backend
      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userMongoId: user?.publicMetadata?.userMongoId, // set in your Clerk webhook
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        return setError(data.message || "Failed to create listing");
      }

      // Redirect to listing page
      router.push(`/listing/${data._id}`);
    } catch (err) {
      console.log("Error creating listing:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>

      <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 flex-1">

          {/* Text Fields */}
          <input
            type="text"
            placeholder="Name"
            id="name"
            className="border p-3 rounded-lg"
            maxLength={62}
            minLength={10}
            required
            onChange={handleChange}
            value={formData.name}
          />

          <textarea
            placeholder="Description"
            id="description"
            className="border p-3 rounded-lg"
            required
            onChange={handleChange}
            value={formData.description}
          />

          <input
            type="text"
            placeholder="Address"
            id="address"
            className="border p-3 rounded-lg"
            required
            onChange={handleChange}
            value={formData.address}
          />

          {/* Type + Features */}
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>

          {/* Numbers */}
          <div className="flex flex-wrap gap-6 mt-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min={1}
                max={10}
                required
                className="p-3 border rounded-lg w-24"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min={1}
                max={10}
                required
                className="p-3 border rounded-lg w-24"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min={50}
                max={10000000}
                required
                className="p-3 border rounded-lg w-32"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col">
                <p>Regular Price</p>
                <span className="text-xs text-gray-500">($ / month)</span>
              </div>
            </div>

            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min={0}
                  max={10000000}
                  required
                  className="p-3 border rounded-lg w-32"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col">
                  <p>Discount Price</p>
                  <span className="text-xs text-gray-500">($ / month)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - no image */}
        <div className="flex flex-col flex-1 gap-4">
          <button
            type="submit"
            className="p-3 bg-slate-700 text-white rounded-lg uppercase"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>

          {error && <p className="text-red-500">{error}</p>}
        </div>
      </form>
    </main>
  );
}