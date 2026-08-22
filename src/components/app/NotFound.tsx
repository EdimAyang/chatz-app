// import { Link } from "@tanstack/react-router";
// import styled from "styled-components";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <h1>404</h1>
      <p>Page not found</p>
    </div>
  );
}

// const ButtonLink = styled(Link)`
//   display: inline-flex;
//   justify-content: center;
//   align-items: center;

//   margin-top: 1.5rem;
//   padding: 0.75rem 1.5rem;

//   border-radius: 8px;

//   text-decoration: none;
//   font-size: 0.95rem;
//   font-weight: 500;

//   color: ${({ theme }) => theme.colors.textPrimary};
//   background-color: ${({ theme }) => theme.colors.primary};

//   transition: background-color 0.2s ease;

//   &:hover {
//     background-color: ${({ theme }) => theme.colors.background};
//   }
// `;

// const Heading = styled.h2`
//   margin-top: 1rem;
//   font-size: 1.5rem;
//   font-weight: 600;
// `;

// const Container = styled.div`
//   min-height: 100vh;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   padding: 1rem;
// `;

// const Content = styled.div`
//   max-width: 32rem;
//   text-align: center;
// `;

// const Title = styled.h1`
//   margin: 0;
//   font-size: 2rem;
//   font-weight: 600;
// `;

// const Description = styled.p`
//   margin-top: 0.75rem;
//   line-height: 1.6;
//   color: ${({ theme }) => theme.colors.textSecondary};
// `;
