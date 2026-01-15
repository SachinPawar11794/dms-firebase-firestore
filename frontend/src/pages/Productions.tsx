import { useWindowSize } from '../hooks/useWindowSize';
import { usePlant } from '../contexts/PlantContext';

const Productions = () => {
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const { selectedPlant } = usePlant();

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: isMobile ? '24px' : '32px', marginBottom: '8px' }}>Production Management</h1>
        {selectedPlant && (
          <p style={{ color: 'var(--text-light)' }}>
            Viewing: {selectedPlant.name} ({selectedPlant.code})
          </p>
        )}
      </div>
      <div className="card">
        <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '40px' }}>
          Production management module - Coming soon
          {selectedPlant && (
            <span style={{ display: 'block', marginTop: '12px', fontSize: '14px' }}>
              Data will be filtered by: {selectedPlant.name}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default Productions;
