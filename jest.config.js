module.exports = {
  // Use projects to handle both Node and DOM tests
  projects: [
    {
      displayName: 'node',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/tests/**/*.test.ts',
        '<rootDir>/src/**/*.test.ts'
      ],
      testPathIgnorePatterns: ['<rootDir>/src/ui/'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: {
            target: 'ES2020',
            module: 'CommonJS',
            esModuleInterop: true,
            moduleResolution: 'node',
            skipLibCheck: true,
            isolatedModules: true,
          }
        }]
      }
    },
    {
      displayName: 'dom',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/ui/**/*.test.tsx'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            jsx: 'react-jsx',
            esModuleInterop: true,
            module: 'CommonJS',
            moduleResolution: 'node',
            target: 'ES2020',
            lib: ['ES2020', 'DOM'],
            skipLibCheck: true,
          }
        }]
      }
    }
  ]
};
