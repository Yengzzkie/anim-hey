import styled from "styled-components";

const FooterDiv = styled.footer`
  position: sticky;
  bottom: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  box-shadow: 0 -5px 5px #000000;
  background-color: #141414;
  padding: .5rem;
  z-index: 99;
`;

export default function Footer() {
  return (
    <FooterDiv>Yengzzkie Dzigntech &copy;</FooterDiv>
  );
}