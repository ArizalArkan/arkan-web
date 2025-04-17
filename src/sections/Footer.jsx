function Footer() {
  return (
    <section className="c-space pt-7 pb-3 border-t border-black-300 flex justify-between items-center flex-wrap gap-5">
      <div className="text-white-500 flex gap-2">
        <p>Create with ❤</p>
      </div>

      <div className="flex gap-3">
        <div
          className="social-icon cursor-pointer"
          onClick={() => window.open("https://github.com/ArizalArkan")}
        >
          <img src="/assets/github.svg" alt="github" className="w-1/2 h-1/2" />
        </div>
        <div className="social-icon cursor-pointer">
          <img
            src="/assets/instagram.svg"
            alt="instagram"
            className="w-1/2 h-1/2"
          />
        </div>
      </div>

      <p className="text-white-500">© Arizal Arkan 2025</p>
    </section>
  );
}

export default Footer;
