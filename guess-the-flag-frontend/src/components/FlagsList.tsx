// src/components/FlagsList.tsx
import { useQuery } from '@apollo/client';
import { GET_FLAGS } from '../queriesAndMutations';

export default function FlagsList() {
  const { loading, error, data } = useQuery(GET_FLAGS);

  if (loading) return <p>Loading flags...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Flags</h2>
      <ul>
        {data.flags.map((flag: any) => (
          <li key={flag.id}>
            <strong>{flag.name}</strong>
            <br />
            <img src={flag.imageUrl} alt={flag.name} width={50} />
          </li>
        ))}
      </ul>
    </div>
  );
}
