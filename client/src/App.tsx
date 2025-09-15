import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NegotiatedFareManager from "@/pages/NegotiatedFareManager";
import DynamicDiscountEngine from "@/pages/DynamicDiscountEngine";
import AirAncillariesDiscounting from "@/pages/AirAncillariesDiscounting";
import NonAirAncillaries from "@/pages/NonAirAncillaries";
import AncillaryBundlingEngine from "@/pages/AncillaryBundlingEngine";
import OfferRuleBuilder from "@/pages/OfferRuleBuilder";
import OfferComposer from "@/pages/OfferComposer";
import AgentChannelManager from "@/pages/AgentChannelManager";
import CohortManager from "@/pages/CohortManager";
import AgentTierManager from "@/pages/AgentTierManager";
import CampaignManager from "@/pages/CampaignManager";
import LogsVersionHistory from "@/pages/LogsVersionHistory";
import AnalyticsSimulation from "@/pages/AnalyticsSimulation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        <ProtectedRoute>
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/negotiated-fare-manager" component={NegotiatedFareManager} />
              <Route path="/dynamic-discount-engine" component={DynamicDiscountEngine} />
              <Route path="/air-ancillaries-discounting" component={AirAncillariesDiscounting} />
              <Route path="/non-air-ancillaries" component={NonAirAncillaries} />
              <Route path="/ancillary-bundling-engine" component={AncillaryBundlingEngine} />
              <Route path="/offer-rule-builder" component={OfferRuleBuilder} />
              <Route path="/offer-composer" component={OfferComposer} />
              <Route path="/agent-channel-manager" component={AgentChannelManager} />
              <Route path="/cohort-manager" component={CohortManager} />
              <Route path="/agent-tier-manager" component={AgentTierManager} />
              <Route path="/campaign-manager" component={CampaignManager} />
              <Route path="/logs-version-history" component={LogsVersionHistory} />
              <Route path="/analytics-simulation" component={AnalyticsSimulation} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
