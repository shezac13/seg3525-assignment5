import React from 'react';

const NHL = () => {
    return (
        <div className="page-wrapper">
            <div className="page-content">
                <h1>NHL Page</h1>
                <p>This page is coming soon!</p>
                {/* Add some extra content to test scrolling */}
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p>Scroll to see the navbar behavior!</p>
                </div>
            </div>
        </div>
    );
};

export default NHL;
