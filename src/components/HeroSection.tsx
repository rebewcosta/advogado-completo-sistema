import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"; // CardFooter importado, mas não usado no código original. Mantendo por precaução.
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Star } from "lucide-react";
import image from "../assets/growth.png"; // Imagem de exemplo, caminho pode variar
import cubeLeg from "../assets/cube-leg.png"; // Imagem de exemplo, caminho pode variar
import { Button } from "./ui/button";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const HeroSection = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Verifica se o app já foi instalado através de algum mecanismo (ex: localStorage)
      // Esta é uma lógica simplificada. Em um app real, você pode querer
      // uma verificação mais robusta ou confiar no navegador.
      if (localStorage.getItem("appInstalled") === "true") {
        setIsAppInstalled(true);
        return;
      }
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Verifica se o app já está rodando como PWA instalado
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true) {
      setIsAppInstalled(true);
      localStorage.setItem("appInstalled", "true"); // Marca como instalado
    } else {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }
    

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null); // Limpa o prompt pois o app foi instalado
      localStorage.setItem("appInstalled", "true"); // Marca como instalado
      toast.success("JusGestão instalado com sucesso!");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Usuário aceitou a instalação do PWA");
          // Não precisa mais do evento, o navegador cuidará disso
          // e o evento 'appinstalled' será disparado.
        } else {
          console.log("Usuário recusou a instalação do PWA");
          toast.info("Você pode instalar o app a qualquer momento pelo menu do navegador.");
        }
        // Não precisamos mais do prompt após a tentativa
        // setDeferredPrompt(null); // Removido para permitir nova tentativa se recusado, dependendo da política do navegador
      });
    } else if(isAppInstalled) {
      toast.info("O App JusGestão já está instalado!");
    } else {
      // Fallback para navegadores que não suportam beforeinstallprompt ou se o evento não foi capturado
      // Isso pode acontecer se o PWA não atender aos critérios de instalabilidade ou se o prompt já foi usado.
      toast.error("Não foi possível iniciar a instalação automática. Verifique se seu navegador suporta PWAs e se os critérios de instalação foram atendidos. Você pode tentar instalar manualmente através do menu do navegador (ícone de 'adicionar à tela inicial' ou similar).");
    }
  };

  return (
    <section id="hero" className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      {/* Conteúdo da esquerda (texto) */}
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
              JusGestão
            </span>{" "}
            para Advogados
          </h1>{" "}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              Eficientes
            </span>{" "}
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Transforme sua prática jurídica com o JusGestão. Gerencie casos, clientes e finanças de forma integrada e eficiente.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Link
            to="/cadastro"
            className={`w-full md:w-1/3 ${buttonVariants({
              variant: "default",
            })}`}
          >
            Comece Agora
          </Link>

          <a
            rel="noreferrer noopener"
            href="https://github.com/rebecaWest/advogado-completo-sistema"
            target="_blank"
            className={`w-full md:w-1/3 ${buttonVariants({
              variant: "outline",
            })}`}
          >
            Projeto no GitHub
            <GitHubLogoIcon className="ml-2 w-5 h-5" />
          </a>
        </div>
        
        {/* Botão de Ação e Texto de Instalação PWA */}
        {deferredPrompt && !isAppInstalled && (
          <div className="space-y-4 md:space-y-0 md:space-x-4 text-left md:text-center lg:text-start pt-6"> {/* MODIFICAÇÃO AQUI pt-6 adicionado para espaçamento */}
            <Button
              onClick={handleInstallClick}
              className="w-full md:w-auto justify-start md:justify-center" /* MODIFICAÇÃO AQUI */
            >
              Instale o App JusGestão
            </Button>
            <p className="text-sm text-muted-foreground mt-2 md:mt-0"> {/* Este herdará o text-left em mobile */}
              Tenha na sua tela inicial para acesso rápido e fácil!
            </p>
          </div>
        )}
         {isAppInstalled && (
           <div className="text-left md:text-center lg:text-start pt-6"> {/* Mantendo consistência de alinhamento */}
            <Badge variant="success" className="text-md"> <Star className="mr-2 h-4 w-4" /> App JusGestão Instalado!</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Acesse rapidamente pela sua lista de aplicativos.
            </p>
          </div>
        )}
      </div>

      {/* Conteúdo da direita (imagem e cards) */}
      <div className="z-10">
        <div className="hidden lg:flex flex-row space-x-4">
            {/* Card 1 */}
            <Card className="w-72  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
                <CardHeader>
                    <CardTitle  className="flex items-center justify-between" >Funcionalidade 1 <Badge variant="default" className="ml-2" >NFC-e</Badge></CardTitle>
                    <CardDescription>Descrição breve da funcionalidade 1.</CardDescription>
                </CardHeader>
                {/* <CardContent>Conteúdo da funcionalidade 1, talvez um ícone ou breve estatística.</CardContent> */}
            </Card>
            {/* Card 2 */}
             <Card className="w-72  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
                <CardHeader>
                    <CardTitle  className="flex items-center justify-between" >Funcionalidade 2 <Badge variant="secondary" className="ml-2" >IA</Badge></CardTitle>
                    <CardDescription>Descrição breve da funcionalidade 2.</CardDescription>
                </CardHeader>
                {/* <CardContent>Conteúdo da funcionalidade 2.</CardContent> */}
            </Card>
        </div>
         {/* Imagem Principal */}
        <div className="hidden lg:block mt-[-100px]"> {/* Ajuste o mt para a sobreposição desejada */}
            <img
                src={image}
                className="w-full md:w-[500px] lg:w-[600px] object-contain rounded-lg" // Aumentado o tamanho da imagem
                alt="Sobre a plataforma JusGestão"
            />
        </div>
        {/* Card Flutuante */}
        <Card className="hidden lg:block absolute top-[calc(50%_-_10px)] left-[calc(50%_-_200px)] w-72  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        {/* // <Card className="absolute top-[50px] left-4 w-72  drop-shadow-xl shadow-black/10 dark:shadow-white/10"> */}

            <CardHeader>
                <CardTitle  className="flex items-center justify-between" >Funcionalidade 3 <Badge variant="destructive" className="ml-2" >Exclusivo</Badge></CardTitle>
                <CardDescription>Descrição breve da funcionalidade 3.</CardDescription>
            </CardHeader>
             <CardFooter>
                <div className="flex items-center">
                    <Star className="fill-primary text-primary mr-1" size={16}/>
                    <Star className="fill-primary text-primary mr-1" size={16}/>
                    <Star className="fill-primary text-primary mr-1" size={16}/>
                    <Star className="fill-primary text-primary mr-1" size={16}/>
                    <Star className="fill-primary text-primary" size={16}/> {/* Exemplo de 5 estrelas */}
                    <span className="text-xs text-muted-foreground ml-2">(+1000 Avaliações)</span>
                </div>
            </CardFooter>
        </Card>
      </div>

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};