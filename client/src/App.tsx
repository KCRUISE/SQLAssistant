import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import SqlGenerator from "@/pages/SqlGenerator";
import SqlTransformer from "@/pages/SqlTransformer";
import SqlExplainer from "@/pages/SqlExplainer";
import DataVisualizer from "@/pages/DataVisualizer";
import SchemaManager from "@/pages/SchemaManager";
import QueryHistory from "@/pages/QueryHistory";
import Sharing from "@/pages/Sharing";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={SqlGenerator} />
        <Route path="/transform" component={SqlTransformer} />
        <Route path="/explain" component={SqlExplainer} />
        <Route path="/visualize" component={DataVisualizer} />
        <Route path="/schema" component={SchemaManager} />
        <Route path="/history" component={QueryHistory} />
        <Route path="/sharing" component={Sharing} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="sql-assistant-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
