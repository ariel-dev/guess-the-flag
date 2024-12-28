import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_FLAGS } from '../graphql/queries';

function FlagCarousel() {
  const { data, loading, error } = useQuery(GET_FLAGS);

  if (loading) return <div className="carousel-loading">Loading flags...</div>;
  if (error) return null;

  // Duplicate the flags array to create a seamless loop
  const duplicatedFlags = data?.flags ? [...data.flags, ...data.flags] : [];

  return (
    <div className="flag-carousel">
      <div className="flag-track">
        {duplicatedFlags.map((flag, index) => (
          <div key={`${flag.id}-${index}`} className="flag-slide">
            <img 
              src={flag.imageUrl} 
              alt={flag.name} 
              className="carousel-flag"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default FlagCarousel; 