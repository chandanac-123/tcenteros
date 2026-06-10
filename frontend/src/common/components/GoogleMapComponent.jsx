import React, { useEffect, useState, useRef, use } from "react";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import CustomeModal from "./CustomeModal";
import {
  useFetchCenterLocationMutation,
  useGetCenterLocationQuery,
} from "@api-queries/center-admin/center-profile/Query";
import { useFormik } from "formik";
import { Button } from "@pages/components/ui/button";
import { useAuthStore } from "@store/authStore";
import { Spinner } from "@pages/components/ui/spinner";
const LIBRARIES = ["places"];

const containerStyle = {
  width: "100%",
  height: "400px",
};

function GoogleMapComponent({ open, setLocationOpen }) {
  const inputRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries: LIBRARIES, // stable reference
  });

  const state = useAuthStore.getState();
  const { mutateAsync: fetchCenterLocation, isPending } =
    useFetchCenterLocationMutation();
  const { data: centerLocationData, isFetching: isFetchingLocation } =
    useGetCenterLocationQuery(state?.auth?.center_id);

  const [center, setCenter] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const autocompleteRef = useRef(null);

  // Reset search when modal opens
  useEffect(() => {
    if (open) {
      setSearchValue("");
    }
  }, [open]);

  const initialValues = {
    center_id: state?.auth?.center_id,
    latitude: "",
    longitude: "",
  };

  const formik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      try {
        await fetchCenterLocation(values);
        setLocationOpen(false);
      } catch (error) {
      }
    },
  });

  // Get Current Location
  useEffect(() => {
    if (!open) return;
    //  1. If API already has saved location → use it
    if (centerLocationData?.latitude && centerLocationData?.longitude) {
      const lat = Number(centerLocationData.latitude);
      const lng = Number(centerLocationData.longitude);

      const location = { lat, lng };

      setCenter(location);
      setMarker(location);

      formik.setFieldValue("latitude", lat);
      formik.setFieldValue("longitude", lng);

      return; // ⛔ stop here (don’t fetch current location)
    }

    // 2. Else → fallback to current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const location = { lat, lng };

        setCenter(location);
        setMarker(location);

        formik.setFieldValue("latitude", lat);
        formik.setFieldValue("longitude", lng);
      },
      (error) => {
      },
    );
  }, [open, centerLocationData]);

  //  Search place
  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const location = { lat, lng };
    setCenter(location);
    setMarker(location);
    formik.setFieldValue("latitude", lat);
    formik.setFieldValue("longitude", lng);
    // update input manually
    if (inputRef.current) {
      inputRef.current.value = place.formatted_address || place.name || "";
    }
  };

  //  Click on map → move marker
  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const location = { lat, lng };
    setMarker(location);
    formik.setFieldValue("latitude", lat);
    formik.setFieldValue("longitude", lng);
  };

  return (
    <CustomeModal
      open={open}
      onOpenChange={setLocationOpen}
      className="max-w-3xl w-full"
      header="Fitness center location"
      // onInteractOutside={e => {
      //   const el = document.querySelector('.pac-container')
      //   if (el && el.contains(e.target)) {
      //     e.preventDefault()
      //   }
      // }}
    >
      <form onSubmit={formik.handleSubmit}>
        {!isLoaded || !center ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div style={{ position: "relative", width: "100%", height: "400px" }}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={15}
              onClick={handleMapClick}
            >
              {/* Search */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 10,
                  display: "flex",
                  justifyContent: "center",
                  zIndex: 9999,
                }}
              >
                <div>
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      autocomplete.setFields([
                        "formatted_address",
                        "geometry",
                        "name",
                      ]);
                      autocompleteRef.current = autocomplete;
                    }}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search location..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                      style={{
                        boxSizing: "border-box",
                        border: "1px solid #ccc",
                        width: "300px",
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "6px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        fontSize: "16px",
                        outline: "none",
                      }}
                    />
                  </Autocomplete>
                </div>
              </div>

              {/* Marker */}
              {marker && (
                <Marker
                  position={marker}
                  draggable={true}
                  onDragEnd={(e) => {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    const location = { lat, lng };

                    setMarker(location);
                    formik.setFieldValue("latitude", lat);
                    formik.setFieldValue("longitude", lng);
                  }}
                />
              )}
            </GoogleMap>
          </div>
        )}

        <div className="flex justify-end mt-3 gap-4">
          <Button
            size="addbutton"
            variant="outline_secondary"
            type="button"
            onClick={() => setLocationOpen(false)}
          >
            Close
          </Button>
          <Button type="submit" size="addbutton" disabled={isPending}>
            Save Location
          </Button>
        </div>
      </form>
    </CustomeModal>
  );
}

export default GoogleMapComponent;
