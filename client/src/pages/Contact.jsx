import { useAppContext } from "../context/AppContext";

const Contact = () => {
  const { t } = useAppContext();

  return (
    <div className="mt-16 min-h-[50vh]">
      <div className="flex flex-col items-end w-max">
        <p className="text-2xl font-medium uppercase">{t("contact_title")}</p>
        <div className="w-16 h-0.5 bg-green-500 rounded-full"></div>
      </div>
      <p className="mt-6 text-gray-600">{t("contact_desc")}</p>
    </div>
  );
};

export default Contact;
