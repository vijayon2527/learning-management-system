import React, { useState, useEffect } from 'react';

const MediaDisplay = ({ mediaUrl, altText = 'Media', style=null }) => {
  const [fullMediaUrl, setFullMediaUrl] = useState(null);
  const [isError, setIsError] = useState(false);

  // Function to get the base URL for media files
  const getBaseUrl = () => {
    return process.env.REACT_APP_API_URL || ''; // Use environment variable for base URL
  };

  // UseEffect hook to construct the full URL for the media file
  useEffect(() => {
    if (mediaUrl) {
      const completeUrl = getBaseUrl() + mediaUrl;
      setFullMediaUrl(completeUrl);
    }
  }, [mediaUrl]);

  // Handle error in case the media is not available
  const handleError = () => {
    setIsError(true);
  };

  // Display error message or fallback image in case of an error
  if (isError) {
    return <div>Unable to load the media.</div>;
  }

  return (
    <div>
      {fullMediaUrl ? (
        <img
          src={fullMediaUrl}
          alt={altText}
          onError={handleError} // Handle error if the media fails to load
          style={style} // Apply the dynamic style here
        />
      ) : (
        <div>Loading...</div> // Show a loading message while the media is being fetched
      )}
    </div>
  );
};

export default MediaDisplay;
