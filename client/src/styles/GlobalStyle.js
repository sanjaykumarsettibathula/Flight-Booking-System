import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  /* Box sizing rules */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* Remove default margin and padding */
  body,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  figure,
  blockquote,
  dl,
  dd {
    margin: 0;
    padding: 0;
  }

  /* Set core body defaults */
  body {
    min-height: 100vh;
    text-rendering: optimizeSpeed;
    line-height: 1.5;
    font-family: ${({ theme }) => theme.fonts.body};
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Make images easier to work with */
  img,
  picture {
    max-width: 100%;
    display: block;
  }

  /* Inherit fonts for inputs and buttons */
  input,
  button,
  textarea,
  select {
    font: inherit;
  }

  /* Remove all animations and transitions for people that prefer not to see them */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: ${({ theme }) => theme.lineHeights.tight};
    color: ${({ theme }) => theme.colors.black};
  }

  h1 {
    font-size: ${({ theme }) => theme.fontSizes["4xl"]};
    margin-bottom: ${({ theme }) => theme.space[6]};
  }

  h2 {
    font-size: ${({ theme }) => theme.fontSizes["3xl"]};
    margin-bottom: ${({ theme }) => theme.space[5]};
  }

  h3 {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
    margin-bottom: ${({ theme }) => theme.space[4]};
  }

  h4 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    margin-bottom: ${({ theme }) => theme.space[3]};
  }

  p {
    margin-bottom: ${({ theme }) => theme.space[4]};
    line-height: ${({ theme }) => theme.lineHeights.relaxed};
  }

  /* Links */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: ${({ theme }) => theme.transitions.default};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryDark};
      text-decoration: underline;
    }
  }

  /* Buttons */
  button, .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => `${theme.space[2]} ${theme.space[4]}`};
    border-radius: ${({ theme }) => theme.radii.md};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    line-height: ${({ theme }) => theme.lineHeights.none};
    cursor: pointer;
    transition: ${({ theme }) => theme.transitions.default};
    border: 1px solid transparent;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &.btn-primary {
      background-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.white};

      &:hover:not(:disabled) {
        background-color: ${({ theme }) => theme.colors.primaryDark};
      }
    }

    &.btn-outline {
      background-color: transparent;
      border: 1px solid ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.primary};

      &:hover:not(:disabled) {
        background-color: ${({ theme }) => theme.colors.primary};
        color: ${({ theme }) => theme.colors.white};
      }
    }
  }

  /* Forms */
  .form-group {
    margin-bottom: ${({ theme }) => theme.space[4]};
  }

  label {
    display: block;
    margin-bottom: ${({ theme }) => theme.space[1]};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    color: ${({ theme }) => theme.colors.grayDark};
  }

  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="number"],
  input[type="date"],
  input[type="time"],
  input[type="tel"],
  select,
  textarea {
    width: 100%;
    padding: ${({ theme }) => `${theme.space[2]} ${theme.space[3]}`};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
    font-size: ${({ theme }) => theme.fontSizes.base};
    transition: ${({ theme }) => theme.transitions.default};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight}40;
    }

    &::placeholder {
      color: ${({ theme }) => theme.colors.gray};
    }
  }

  /* Utility classes */
  .container {
    width: 100%;
    max-width: ${({ theme }) => theme.sizes.container.xl};
    margin-left: auto;
    margin-right: auto;
    padding-left: ${({ theme }) => theme.space[4]};
    padding-right: ${({ theme }) => theme.space[4]};
  }

  .text-center {
    text-align: center;
  }

  .mt-1 { margin-top: ${({ theme }) => theme.space[1]}; }
  .mt-2 { margin-top: ${({ theme }) => theme.space[2]}; }
  .mt-3 { margin-top: ${({ theme }) => theme.space[3]}; }
  .mt-4 { margin-top: ${({ theme }) => theme.space[4]}; }
  .mt-6 { margin-top: ${({ theme }) => theme.space[6]}; }
  .mt-8 { margin-top: ${({ theme }) => theme.space[8]}; }

  .mb-1 { margin-bottom: ${({ theme }) => theme.space[1]}; }
  .mb-2 { margin-bottom: ${({ theme }) => theme.space[2]}; }
  .mb-3 { margin-bottom: ${({ theme }) => theme.space[3]}; }
  .mb-4 { margin-bottom: ${({ theme }) => theme.space[4]}; }
  .mb-6 { margin-bottom: ${({ theme }) => theme.space[6]}; }
  .mb-8 { margin-bottom: ${({ theme }) => theme.space[8]}; }

  .flex {
    display: flex;
  }

  .items-center {
    align-items: center;
  }

  .justify-between {
    justify-content: space-between;
  }
`;

export default GlobalStyle;
